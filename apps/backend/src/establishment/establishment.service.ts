import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Establishment } from './entities/establishment.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateEstablishmentDto } from './dtos/create-establishment.dto';
import { UpdateEstablishmentDto } from './dtos/update-establishment.dto';

@Injectable()
export class EstablishmentService {
  constructor(
    @InjectRepository(Establishment)
    private readonly establishment: Repository<Establishment>,
  ) {}

  async getById(id: number) {
    const establishment = await this.establishment.findOne({
      where: { establishment_id: id },
    });

    if (!establishment) {
      throw new NotFoundException('Establishment not found.');
    }

    return establishment;
  }

  async getAll() {
    return this.establishment.find();
  }

  async create(dto: CreateEstablishmentDto) {
    const establishment = this.establishment.create(dto);

    return await this.establishment.save(establishment);
  }

  async update(id: number, attrs: UpdateEstablishmentDto) {
    const establishment = await this.getById(id);

    if (!establishment) {
      throw new NotFoundException('Establishment not found.');
    }

    Object.assign(establishment, attrs);

    return await this.establishment.save(establishment);
  }

  async delete(id: number) {
    const establishment = await this.getById(id);

    if (!establishment) {
      throw new NotFoundException('Establishment not found.');
    }

    await this.establishment.remove(establishment);
  }
}
