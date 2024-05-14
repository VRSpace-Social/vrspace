import { Elysia } from "elysia";

export const routes = new Elysia()

    .get("/api/users", ({set}) => {
        set.headers['x-powered-by'] = 'Elysia'
        set.headers['set-cookie'] = "dio=cane"
        return [
            {
                name: "John Doe",
                email: "johndoe@example.com",
                age: 25
            },
            {
                name: "Erik Doe",
                email: "jane@example.com",
                age: 22
            }
        ];
    })
    .all('/lmao', () => 'hi')