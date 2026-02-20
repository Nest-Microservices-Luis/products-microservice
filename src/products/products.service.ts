import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma.service';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService {

  constructor(private readonly prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto) {
    console.log({ createProductDto });
    const product = await this.prisma.product.create({
      data: createProductDto
    });
    return product;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const totalPages = await this.prisma.product.count({
      where: { available: true }
    });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.prisma.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { available: true }
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage
      }
    }


  }

  async findOne(id: number) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id, available: true }
      });
      if (!product) {
        throw new NotFoundException('Product with id ${id} not found');
      }
      return product;
    } catch (error) {
      throw new NotFoundException('Product not found');
    }

  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const { id: __, ...data } = updateProductDto;

    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: data
    });

  }

  async remove(id: number) {

    // HARD DELETE
    // await this.findOne(id);
    // return this.prisma.product.delete({
    //   where: { id }
    // });
    // SOFT DELETE
    const product = await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { available: false }
    });

  }
}
