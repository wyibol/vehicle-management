declare module 'ali-oss' {
  namespace OSS {
    interface Options {
      region: string;
      accessKeyId: string;
      accessKeySecret: string;
      bucket: string;
      [key: string]: any;
    }

    interface SignatureUrlOptions {
      expires?: number;
      method?: string;
      'Content-Type'?: string;
      [key: string]: any;
    }

    interface PutOptions {
      mime?: string;
      headers?: Record<string, string>;
      [key: string]: any;
    }

    interface PutResult {
      name: string;
      url: string;
      res: {
        status: number;
        requestUrls: string[];
      };
    }

    interface DeleteResult {
      res: {
        status: number;
        statusCode: number;
      };
    }
  }

  class OSS {
    constructor(options: OSS.Options);
    signatureUrl(objectName: string, options?: OSS.SignatureUrlOptions): string;
    put(objectName: string, buffer: Buffer | File | Blob, options?: OSS.PutOptions): Promise<OSS.PutResult>;
    delete(objectName: string): Promise<OSS.DeleteResult>;
    deleteMulti(objectKeys: string[]): Promise<OSS.DeleteResult>;
  }

  export = OSS;
}
