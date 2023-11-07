import { Module } from '@nestjs/common';
import { CoyoteInputTransformer } from '@module/transform-layer/coyote/coyote-input.transformer';
import { CoyoteOutputTransformer } from '@module/transform-layer/coyote/coyote-output.transformer';
import { DatInputTransformer } from '@module/transform-layer/dat/dat-input.transformer';
import { DatOutputTransformer } from '@module/transform-layer/dat/dat-output.transformer';

@Module({
  providers: [
    CoyoteInputTransformer,
    CoyoteOutputTransformer,
    DatInputTransformer,
    DatOutputTransformer
  ],
  exports: [
    CoyoteInputTransformer,
    CoyoteOutputTransformer,
    DatInputTransformer,
    DatOutputTransformer
  ]
})
export class TransformerModule {}
