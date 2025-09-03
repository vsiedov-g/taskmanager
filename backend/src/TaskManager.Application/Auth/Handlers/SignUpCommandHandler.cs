using MediatR;
using TaskManager.Application.Auth.Commands;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Auth.Handlers;

public class SignUpCommandHandler : IRequestHandler<SignUpCommand, AuthResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordService _passwordService;
    private readonly IJwtService _jwtService;
    private readonly IUnitOfWork _unitOfWork;

    public SignUpCommandHandler(
        IUserRepository userRepository,
        IPasswordService passwordService,
        IJwtService jwtService,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _passwordService = passwordService;
        _jwtService = jwtService;
        _unitOfWork = unitOfWork;
    }

    public async Task<AuthResponse> Handle(SignUpCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await _userRepository.GetByNameAsync(request.Name);
        if (existingUser != null)
        {
            throw new InvalidOperationException("User with this name already exists");
        }

        var passwordHash = _passwordService.HashPassword(request.Password);
        
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            PasswordHash = passwordHash
        };

        await _userRepository.AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

        var token = _jwtService.GenerateToken(user);
        
        return new AuthResponse
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Name = user.Name
            }
        };
    }
}