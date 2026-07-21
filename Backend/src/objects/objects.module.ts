import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ObjectsController } from './objects.controller';
import { ObjectsService } from './objects.service';
import { ObjectSchema, OBJECT_MODEL } from './schemas/object.schema';
import { ObjectsGateway } from './objects.gateway';
import { S3Service } from '../services/s3.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: OBJECT_MODEL, schema: ObjectSchema }]),
  ],
  controllers: [ObjectsController],
  providers: [ObjectsService, ObjectsGateway, S3Service],
  exports: [ObjectsService],
})
export class ObjectsModule {}