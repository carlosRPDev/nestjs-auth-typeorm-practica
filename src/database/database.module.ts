import { Module, Global } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Client } from 'pg';
import { TypeOrmModule } from '@nestjs/typeorm';

import config from '../config';

const API_KEY = '12345634';
const API_KEY_PROD = 'PROD1212121SA';

// client.query('SELECT * FROM tasks', (err, res) => {
//   console.error(err);
//   console.log(res.rows);
// });

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [config.KEY],
      useFactory: (configService: ConfigType<typeof config>) => {
        // Lo comentado es configuracion para la conexion bd segmentada dada por variables de entorno
        //const { user, host, dbName, password, port } = configService.postgres;
        return {
          type: 'postgres',
          url: configService.postgresUrl,
          //host,
          //port,
          //username: user,
          //password,
          //database: dbName,
          synchronize: false,
          autoLoadEntities: true,
          ssl: {
            rejectUnauthorized: false,
          },
        };
      },
    }),
  ],
  providers: [
    {
      provide: 'API_KEY',
      useValue: process.env.NODE_ENV === 'prod' ? API_KEY_PROD : API_KEY,
    },
    {
      provide: 'PG',
      useFactory: (configService: ConfigType<typeof config>) => {
        // al igual que en la configuracion con typeorm aqui es con el driver nativo todo lo comentado es para esta configuracion
        // const { user, host, dbName, password, port } = configService.postgres;
        const client = new Client({
          connectionString: configService.postgresUrl,
          ssl: {
            rejectUnauthorized: false,
          },
          //user,
          //host,
          //database: dbName,
          //password,
          //port,
        });
        client.connect();
        return client;
      },
      inject: [config.KEY],
    },
  ],
  exports: ['API_KEY', 'PG', TypeOrmModule],
})
export class DatabaseModule {}
