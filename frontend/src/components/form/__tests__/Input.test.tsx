import { render, screen } from '@testing-library/react';
import { Input } from '../Input';
import { useForm } from 'react-hook-form';

const TestWrapper = () => {
  const { register } = useForm();
  return <Input label="Test Label" register={register('test')} />;
};

describe('Input Component', () => {
  it('renders the label correctly', () => {
    render(<TestWrapper />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('shows error message when provided', () => {
    const mockRegister = {
      name: 'test',
      onChange: jest.fn(),
      onBlur: jest.fn(),
      ref: jest.fn(),
    } as any;
    render(<Input label="Test" register={mockRegister} error="Error message" />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
