import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { RestclientService } from './restclient.service';
import { SelcomClientService } from './selcomClient.service';

@Module({
  imports: [HttpModule],
  providers: [RestclientService, SelcomClientService],
  exports: [RestclientService, SelcomClientService],
})
export class RestClientModule {}
