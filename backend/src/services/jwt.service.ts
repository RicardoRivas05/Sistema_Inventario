import {repository} from '@loopback/repository';
import { UsuarioRepository } from '../repositories';
import { inject, service } from '@loopback/core';
import { EncriptDecryptService } from './encript.service';
import {TokenService} from '@loopback/authentication';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {securityId, UserProfile} from '@loopback/security';

export class JWTService{
    constructor(
        @repository(UsuarioRepository)
        public usuarioRepository : UsuarioRepository,
        @service(EncriptDecryptService)
        public encriptDecryptService : EncriptDecryptService,
        @inject(TokenServiceBindings.TOKEN_SERVICE)
        private jwtService: TokenService,
    ){}

    async createToken(credentials:any, user:any){
        const userProfile:any ={
            [securityId]: credentials.id!.toString(),
            id: credentials.id,
            nombre: credentials.nombre,
            correo: credentials.correo,
        }

        return await this.jwtService.generateToken(userProfile);
    }

    

}