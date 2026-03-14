import { Module } from '@nestjs/common';
import { SelcomService } from './services/selcom.service';
import { RestClientModule } from '../restclient/restclient.module';

@Module({
  imports: [RestClientModule],
  providers: [SelcomService],
  exports: [SelcomService],
})
export class SelcomGwModule {}
