import { service } from "@loopback/core";
import { AuthService } from "../services/auth.service";
import { HttpErrors, post, requestBody, response } from "@loopback/rest";


export class AuthController{
    constructor(
        @service(AuthService)
        public authService: AuthService
    ){}

    @post('/auth/login')
    @response(200, {
        description: 'Login usuario'
    })
    async login(
        @requestBody() loginInterface:any
    ){
        const result = await this.authService.login(loginInterface);
        if(!result) {
            throw new HttpErrors.Unauthorized('Credenciales invalidas');
        }
        return result;
    }

}