import { Button } from 'theme-ui';
import ComponentLoader from '../loaders/ComponentLoader';

interface BaseButtonProps {
  text: string;
  isLoading?: boolean;
}

const BaseButton = ({ text, isLoading = false }: BaseButtonProps) => {
  return (
    <Button type="submit" disabled={isLoading}>
      {isLoading ? <ComponentLoader color="white" /> : text}
    </Button>
  );
};

export default BaseButton;