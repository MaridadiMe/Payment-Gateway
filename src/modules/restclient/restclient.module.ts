import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { RestclientService } from './restclient.service';
import { SelcomClientService } from './selcomClient.service';
import { SnippeClient } from './snippeClient.service';

@Module({
  imports: [HttpModule],
  providers: [RestclientService, SelcomClientService, SnippeClient],
  exports: [RestclientService, SelcomClientService, SnippeClient],
})
export class RestClientModule {}
