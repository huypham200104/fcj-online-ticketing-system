import { NotFoundError } from '../../domain/errors/AppError.js';

export class GetUserProfileUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  }
}
