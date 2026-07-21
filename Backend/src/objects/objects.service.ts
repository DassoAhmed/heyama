import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectEntity } from './schemas/object.schema';
import { CreateObjectDto } from './dto/create-object.dto';
import { S3Service } from '../services/s3.service';
import { ObjectResponseDto } from './dto/object-response.dto';

@Injectable()
export class ObjectsService {
  constructor(
    @InjectModel(ObjectEntity.name) private objectModel: Model<ObjectEntity>,
    private s3Service: S3Service,
  ) {}

  async create(createObjectDto: CreateObjectDto, file: Express.Multer.File): Promise<ObjectResponseDto> {
    const imageUrl = await this.s3Service.uploadFile(file);
    const createdObject = new this.objectModel({
      ...createObjectDto,
      imageUrl,
    });
    const savedObject = await createdObject.save();
    return this.toResponseDto(savedObject);
  }

  async findAll(): Promise<ObjectResponseDto[]> {
    const objects = await this.objectModel.find().sort({ createdAt: -1 }).exec();
    return objects.map(obj => this.toResponseDto(obj));
  }

  async findOne(id: string): Promise<ObjectResponseDto> {
    const object = await this.objectModel.findById(id).exec();
    if (!object) {
      throw new NotFoundException('Object not found');
    }
    return this.toResponseDto(object);
  }

  async delete(id: string): Promise<void> {
    const object = await this.objectModel.findById(id).exec();
    if (!object) {
      throw new NotFoundException('Object not found');
    }
    await this.s3Service.deleteFile(object.imageUrl);
    await this.objectModel.findByIdAndDelete(id).exec();
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