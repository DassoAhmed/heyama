import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ObjectsController } from './objects.controller';
import { ObjectsService } from './objects.service';
import { ObjectSchema } from './schemas/object.schema';
import { ObjectsGateway } from './objects.gateway';
import { S3Service } from '../services/s3.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'ObjectEntity', schema: ObjectSchema }]),
  ],
  controllers: [ObjectsController],
  providers: [ObjectsService, ObjectsGateway, S3Service],
})
export class ObjectsModule {}