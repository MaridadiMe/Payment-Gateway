export class SelcomApiResponseDto {
  reference: string;
  transid: string;
  resultcode: string;
  result: SelcomResult;
  message: string;
  data: any[];
}

export enum SelcomResult {
  SUCCESS = 'SUCCESS',
  INPROGRESS = 'INPROGRESS',
  AMBIGOUS = 'AMBIGOUS',
  FAIL = 'FAIL',
}
