using MediatR;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Application.DTOs;
using TaskManager.Application.Users.Commands;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Users.Handlers;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, UserDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordService _passwordService;
    private readonly IUnitOfWork _unitOfWork;

    public CreateUserCommandHandler(
        IUserRepository userRepository,
        IPasswordService passwordService,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _passwordService = passwordService;
        _unitOfWork = unitOfWork;
    }

    public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null)
        {
            throw new InvalidOperationException("User with this email already exists");
        }

        var passwordHash = _passwordService.HashPassword(request.Password);
        
        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = passwordHash
        };

        await _userRepository.AddAsync(user);
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