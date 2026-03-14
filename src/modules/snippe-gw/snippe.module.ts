import { Module } from '@nestjs/common';
import { SnippeService } from './services/snippe.service';
import { RestClientModule } from '../restclient/restclient.module';
import { SnippeRepository } from './repositories/snippe.repository';

@Module({
  imports: [RestClientModule],
  providers: [SnippeService, SnippeRepository],
  exports: [SnippeService],
  controllers: [],
})
export class SnippeModule {}
