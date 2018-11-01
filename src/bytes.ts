export class Bytes {

  static toBytes(content: string): number[] {
    var bytes: number[] = [];

    content.split(/\s+/).forEach(element => {
      bytes.push(parseInt(element, 16));
    });

    return bytes;
  }
  
}