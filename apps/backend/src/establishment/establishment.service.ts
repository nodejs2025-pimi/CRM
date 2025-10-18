import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Establishment } from './entities/establishment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EstablishmentService {
  constructor(
    @InjectRepository(Establishment)
    private readonly establishment: Repository<Establishment>,
  ) {}
}
