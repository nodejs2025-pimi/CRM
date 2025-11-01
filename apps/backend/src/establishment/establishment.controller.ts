import { Controller } from '@nestjs/common';
import {
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiNoContentResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ParseIntPipe } from '@nestjs/common';
import { CreateEstablishmentDto } from './dtos/create-establishment.dto';
import { UpdateEstablishmentDto } from './dtos/update-establishment.dto';
import { EstablishmentService } from './establishment.service';
import { GetEstablishmentDto } from './dtos/get-establishment.dto';

@Controller('establishments')
@ApiBearerAuth()
export class EstablishmentController {
  constructor(private readonly establishmentService: EstablishmentService) {}

  @Get(':id')
  @ApiOkResponse({
    type: GetEstablishmentDto,
    description: 'Establishment retrieved successfully.',
  })
  @ApiNotFoundResponse({ description: 'Establishment not found.' })
  getEstablishment(@Param('id', ParseIntPipe) id: number) {
    return this.establishmentService.getById(id);
  }

  @Get()
  @ApiOkResponse({
    type: [GetEstablishmentDto],
    description: 'Establishments retrieved successfully.',
  })
  getEstablishmentsList() {
    return this.establishmentService.getAll();
  }

  @Post()
  @ApiCreatedResponse({
    type: GetEstablishmentDto,
    description: 'Establishment created successfully.',
  })
  createEstablishment(@Body() dto: CreateEstablishmentDto) {
    return this.establishmentService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({
    type: GetEstablishmentDto,
    description: 'Establishment updated successfully.',
  })
  @ApiNotFoundResponse({ description: 'Establishment not found.' })
  updateEstablishment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstablishmentDto,
  ) {
    return this.establishmentService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Establishment deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Establishment not found.' })
  deleteEstablishment(@Param('id', ParseIntPipe) id: number) {
    return this.establishmentService.delete(id);
  }
}
