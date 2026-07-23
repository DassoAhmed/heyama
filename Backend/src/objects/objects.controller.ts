import { Controller, Get, Post, Delete, Param, Body, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
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
    @UploadedFile() file: any,
  ): Promise<ObjectResponseDto> {
    try {
      if (!file) {
        throw new HttpException('Image file is required', HttpStatus.BAD_REQUEST);
      }
      
      const newObject = await this.objectsService.create(createObjectDto, file);
      
      // Notify via WebSocket
      this.objectsGateway.notifyObjectCreated(newObject);
      
      return newObject;
    } catch (error: any) {
      const message = error?.message ?? 'Failed to create object';
      console.error('❌ Error in create controller:', message);
      throw new HttpException(
        message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async findAll(): Promise<ObjectResponseDto[]> {
    try {
      return await this.objectsService.findAll();
    } catch (error: any) {
      const message = error?.message ?? 'Failed to fetch objects';
      console.error('❌ Error in findAll controller:', message);
      throw new HttpException(
        'Failed to fetch objects',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ObjectResponseDto> {
    try {
      return await this.objectsService.findOne(id);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      if (error?.status === 404) {
        throw new HttpException('Object not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Failed to fetch object',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    try {
      await this.objectsService.delete(id);
      
      // Notify via WebSocket
      this.objectsGateway.notifyObjectDeleted(id);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      if (error?.status === 404) {
        throw new HttpException('Object not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Failed to delete object',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}