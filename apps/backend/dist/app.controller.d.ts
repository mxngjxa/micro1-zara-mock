import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHealth(): {
        success: boolean;
        data: {
            status: string;
            timestamp: string;
            environment: string | undefined;
        };
    };
    getHello(): string;
}
