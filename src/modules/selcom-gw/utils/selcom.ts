import * as crypto from 'crypto';

import { format, toZonedTime } from 'date-fns-tz';

export class SelcomUtils {
  static generateHeaders(payload: Record<string, any>): Record<string, string> {
    const timestamp = this.generateTimestamp();

    const signedFields = Object.keys(payload); // preserve order if already defined correctly
    const signingString = this.buildSigningString(
      timestamp,
      payload,
      signedFields,
    );

    const digest = this.computeHmacDigest(signingString);

    return {
      Authorization: this.getAuthorizationHeader(),
      Timestamp: timestamp,
      'Digest-Method': 'HS256',
      Digest: digest,
      'Signed-Fields': signedFields.join(','),
      'Content-Type': 'application/json',
    };
  }

  static buildSigningString(
    timestamp: string,
    payload: Record<string, any>,
    signedFields: string[],
  ): string {
    const keyValuePairs = signedFields.map((key) => {
      const value =
        payload[key] !== undefined && payload[key] !== null
          ? String(payload[key])
          : '';
      return `${key}=${value}`;
    });

    return `timestamp=${timestamp}&${keyValuePairs.join('&')}`;
  }

  private static computeHmacDigest(data: string): string {
    const secret = process.env.SELCOM_API_SECRET!;

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(data);

    return hmac.digest('base64');
  }

  static stringToBase64(str: string): string {
    return Buffer.from(str, 'utf-8').toString('base64');
  }

  static getAuthorizationHeader(): string {
    const realm = process.env.SELCOM_AUTH_HEADER_REALM || 'SELCOM';
    const apiKey = process.env.SELCOM_API_KEY!;

    return `${realm} ${this.stringToBase64(apiKey)}`;
  }

  static generateTimestamp(): string {
    const utcDate = new Date(); // current UTC time
    const zonedDate = toZonedTime(utcDate, 'Africa/Dar_es_Salaam'); // shift to EAT
    return format(zonedDate, "yyyy-MM-dd'T'HH:mm:ssXXX", {
      timeZone: 'Africa/Dar_es_Salaam',
    });
  }
}
