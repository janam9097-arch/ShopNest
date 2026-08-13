import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Store, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    toast.success('If an account exists with this email, a reset link has been sent.');
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-11 h-11 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
        </Link>
        <h1 className="text-2xl font-bold font-display text-surface-900">Reset Password</h1>
        <p className="text-surface-500 mt-1 text-sm">Enter your email to receive a reset link</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8 border border-surface-100">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Email</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
              placeholder="your@email.com"
            />
            {errors.email && <p className="mt-1 text-xs text-error-500">{errors.email.message}</p>}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            Send Reset Link
          </button>
        </form>
        <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-surface-500 mt-6 hover:text-primary-600">
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
