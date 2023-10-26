import { Module } from '@nestjs/common';
import { InputTransformer } from '@module/transform-layer/input.transformer';
import { OutputTransformer } from '@module/transform-layer/output.transformer';
import { CoyoteInputTransformer } from '@module/transform-layer/coyote/coyote-input.transformer';
import { CoyoteOutputTransformer } from '@module/transform-layer/coyote/coyote-output.transformer';

@Module({
  providers: [InputTransformer, OutputTransformer, CoyoteInputTransformer, CoyoteOutputTransformer],
  exports: [InputTransformer, OutputTransformer]
})
export class TransformerModule {}