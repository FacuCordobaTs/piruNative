import { Text, TextProps } from 'react-native';

export function T({ className, ...props }: TextProps & { className?: string }) {
  return (
    <Text 
      className={['font-cinzel', className].filter(Boolean).join(' ')} 
      {...props} 
    />
  );
}
