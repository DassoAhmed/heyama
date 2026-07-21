import { Controller, Get, Post, Delete, Param, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ObjectsService } from './objects.service';
import { CreateObjectDto } from './dto/create-object.dto';
import { ObjectResponseDto } from './dto/object-response.dto';
import { ObjectsGateway } from './objects.gateway';

@Controller('objects')
export class ObjectsController {
  constructor(
    private readonly objectsService: ObjectsService,
    private readonly objectsGateway: ObjectsGateway,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createObjectDto: CreateObjectDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ObjectResponseDto> {
    const newObject = await this.objectsService.create(createObjectDto, file);
    this.objectsGateway.notifyObjectCreated(newObject);
    return newObject;
  }

  @Get()
  async findAll(): Promise<ObjectResponseDto[]> {
    return this.objectsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ObjectResponseDto> {
    return this.objectsService.findOne(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.objectsService.delete(id);
    this.objectsGateway.notifyObjectDeleted(id);
  }
}