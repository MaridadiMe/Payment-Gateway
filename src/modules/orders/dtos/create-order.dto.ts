import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clientReference: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  buyerName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  buyerEmail: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  buyerPhone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  totalAmount: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiPropertyOptional()
  @IsString()
  description?: string;
}
