export class EmailModel{
  subject?: string;
  toAddresses: string[];
  ccAddresses: string[];
  body: string;
}
