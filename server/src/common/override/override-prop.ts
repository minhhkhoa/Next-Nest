import { Prop as OriginalProp, PropOptions } from '@nestjs/mongoose';

export function PropCustom(type?: any): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const propKeyStr = String(propertyKey);
    const props: { key: string; type?: any; isArray: boolean }[] =
      Reflect.getMetadata('__props__', target) || [];

    let detectedType =
      type || Reflect.getMetadata('design:type', target, propertyKey);

    let isArray = false;
    if (Array.isArray(detectedType)) {
      detectedType = detectedType[0];
      isArray = true;
    } else if (detectedType === Array) {
      isArray = true;
    }

    props.push({ key: propKeyStr, type: detectedType, isArray });
    Reflect.defineMetadata('__props__', props, target);
  };
}

export function Prop(options?: PropOptions): PropertyDecorator {
  return function (target: object, propertyKey: string | symbol) {
    if (typeof options === 'object' && options !== null) {
      PropCustom((options as any).type)(target, propertyKey);
    }
    return OriginalProp(options)(target, propertyKey);
  };
}
