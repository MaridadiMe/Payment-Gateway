import { Module } from '@nestjs/common';
import { SnippeService } from './services/snippe.service';
import { RestClientModule } from '../restclient/restclient.module';

@Module({
  imports: [RestClientModule],
  providers: [SnippeService],
  exports: [SnippeService],
  controllers: [],
})
export class SnippeModule {}
