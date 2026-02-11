import { Module } from '@nestjs/common';
import { SelcomService } from './services/selcom.service';
import { RestClientModule } from '../restclient/restclient.module';
import { SelcomController } from './controllers/selcom.controller';

@Module({
  imports: [RestClientModule],
  controllers: [SelcomController],
  providers: [SelcomService],
  exports: [SelcomService],
})
export class SelcomGwModule {}
