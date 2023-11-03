import { Module } from '@nestjs/common';
import { InputTransformer } from '@module/transform-layer/input.transformer';
import { OutputTransformer } from '@module/transform-layer/output.transformer';
import { CoyoteInputTransformer } from '@module/transform-layer/coyote/coyote-input.transformer';
import { CoyoteOutputTransformer } from '@module/transform-layer/coyote/coyote-output.transformer';
import { TruckStopInputTransformer } from '@module/transform-layer/truck-stop/truck-stop.transformer';

@Module({
  providers: [
    InputTransformer,
    OutputTransformer,
    CoyoteInputTransformer,
    CoyoteOutputTransformer,
    TruckStopInputTransformer
  ],
  exports: [InputTransformer, OutputTransformer]
})
export class TransformerModule {}
