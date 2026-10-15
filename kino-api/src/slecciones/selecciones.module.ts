import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeleccionesController } from './selecciones.controller';
import { SeleccionesService } from './selecciones.service';
import { SeleccionSchema } from './schema/seleccion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Seleccion',
        schema: SeleccionSchema,
        collection: 'selecciones',
      },
    ]),
  ],
  controllers: [SeleccionesController],
  providers: [SeleccionesService],
  exports: [SeleccionesService],
})
export class SeleccionesModule {}
