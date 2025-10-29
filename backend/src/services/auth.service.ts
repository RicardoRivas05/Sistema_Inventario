import { service } from "@loopback/core";
import {repository} from '@loopback/repository';
import { UsuarioRepository } from "../repositories";

export class AuthService {
    constructor(
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository
    ){}

    async login(loginInterface:any){
        if(!loginInterface) return false;

        let credenciales = await this.usuarioRepository.findOne({
            where: {correo: loginInterface.correo},
            order: ['idUsuario DESC'],
            limit: 1
        }) 

        if(!credenciales){
            credenciales = await this.usuarioRepository.findOne({
                where: {usuario: loginInterface.correo},
                order: ['idUsuario DESC'],
                limit: 1
            }) 
        }

        if(!credenciales) return false;

        //Validar contraseña
        if(credenciales.password !== loginInterface.password){
            return false;
        }
        
        return credenciales;
    }

}