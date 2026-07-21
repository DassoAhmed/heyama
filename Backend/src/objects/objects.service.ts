import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectEntity, OBJECT_MODEL } from './schemas/object.schema';
import { CreateObjectDto } from './dto/create-object.dto';
import { S3Service } from '../services/s3.service';
import { ObjectResponseDto } from './dto/object-response.dto';

@Injectable()
export class ObjectsService {
  constructor(
    @InjectModel(OBJECT_MODEL) private objectModel: Model<ObjectEntity>,
    private s3Service: S3Service,
  ) {}

  async create(createObjectDto: CreateObjectDto, file: Express.Multer.File): Promise<ObjectResponseDto> {
    try {
      // Upload image to S3
      const imageUrl = await this.s3Service.uploadFile(file);
      
      // Create object in database
      const createdObject = new this.objectModel({
        ...createObjectDto,
        imageUrl,
      });
      
      const savedObject = await createdObject.save();
      console.log('✅ Object saved to database:', savedObject._id);
      
      return this.toResponseDto(savedObject);
    } catch (error) {
      console.error('❌ Error creating object:', error.message);
      throw new InternalServerErrorException(`Failed to create object: ${error.message}`);
    }
  }

  async findAll(): Promise<ObjectResponseDto[]> {
    try {
      const objects = await this.objectModel.find().sort({ createdAt: -1 }).exec();
      return objects.map(obj => this.toResponseDto(obj));
    } catch (error) {
      console.error('❌ Error fetching objects:', error.message);
      throw new InternalServerErrorException('Failed to fetch objects');
    }
  }

  async findOne(id: string): Promise<ObjectResponseDto> {
    try {
      const object = await this.objectModel.findById(id).exec();
      if (!object) {
        throw new NotFoundException('Object not found');
      }
      return this.toResponseDto(object);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('❌ Error fetching object:', error.message);
      throw new InternalServerErrorException('Failed to fetch object');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const object = await this.objectModel.findById(id).exec();
      if (!object) {
        throw new NotFoundException('Object not found');
      }

      // Delete image from S3
      await this.s3Service.deleteFile(object.imageUrl);
      
      // Delete object from database
      await this.objectModel.findByIdAndDelete(id).exec();
      console.log('✅ Object deleted:', id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('❌ Error deleting object:', error.message);
      throw new InternalServerErrorException('Failed to delete object');
    }
  }

  private toResponseDto(object: ObjectEntity): ObjectResponseDto {
    return {
      id: object._id.toString(),
      title: object.title,
      description: object.description,
      imageUrl: object.imageUrl,
      createdAt: object.createdAt,
    };
  }
}