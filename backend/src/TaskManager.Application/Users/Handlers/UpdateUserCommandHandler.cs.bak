using MediatR;
using TaskManager.Application.DTOs;
using TaskManager.Application.Users.Commands;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Users.Handlers;

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, UserDto?>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateUserCommandHandler(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UserDto?> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id);
        if (user == null) return null;

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Email = request.Email;

        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync();

        return new UserDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email
        };
    }
}