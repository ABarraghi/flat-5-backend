import { Module } from '@nestjs/common';
import { CoyoteInputTransformer } from '@module/transform-layer/coyote/coyote-input.transformer';
import { CoyoteOutputTransformer } from '@module/transform-layer/coyote/coyote-output.transformer';
import { DatInputTransformer } from '@module/transform-layer/dat/dat-input.transformer';
import { DatOutputTransformer } from '@module/transform-layer/dat/dat-output.transformer';
import { TruckStopInputTransformer } from '@module/transform-layer/truck-stop/truck-stop.transformer';
import { TruckStopOutputTransformer } from '@module/transform-layer/truck-stop/truck-stop-output.transformer';

@Module({
  providers: [
    CoyoteInputTransformer,
    CoyoteOutputTransformer,
    DatInputTransformer,
    DatOutputTransformer,
    TruckStopInputTransformer,
    TruckStopOutputTransformer
  ],
  exports: [
    CoyoteInputTransformer,
    CoyoteOutputTransformer,
    DatInputTransformer,
    DatOutputTransformer,
    TruckStopInputTransformer,
    TruckStopOutputTransformer
  ]
})
export class TransformerModule {}
