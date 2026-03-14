// import { Body, Controller, Headers, Logger, Post } from '@nestjs/common';
// import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
// import { PublicRoute } from 'src/modules/auth/decorators/public-route.decorator';

// @ApiBearerAuth()
// @ApiTags('Selcom')
// @Controller('selcom')
// export class SelcomController {
//   private readonly logger = new Logger(SelcomController.name);
//   @Post('webhook')
//   @PublicRoute()
//   async handleWebhook(
//     @Body() payload: any,
//     @Headers() headers: Record<string, string>,
//   ) {
//     this.logger.debug('Received Selcom webhook headers:');
//     this.logger.debug(JSON.stringify(headers, null, 2));

//     this.logger.debug('Received Selcom webhook payload:');
//     this.logger.debug(JSON.stringify(payload, null, 2));
//   }
// }
