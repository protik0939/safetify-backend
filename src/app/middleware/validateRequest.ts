import { NextFunction, Request, Response } from "express";
import z from "zod";

export const validateRequest = (zodSchema: z.ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.body?.data) {
            req.body = JSON.parse(req.body.data);
        }

        const parsedResult = zodSchema.safeParse({
            body: req.body,
            cookies: req.cookies,
            params: req.params,
            query: req.query,
        });

        if (!parsedResult.success) {
            return next(parsedResult.error);
        }

        req.body = (parsedResult.data as { body: unknown }).body;

        next();
    };
};