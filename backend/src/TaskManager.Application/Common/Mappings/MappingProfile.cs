using AutoMapper;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Entities;

namespace TaskManager.Application.Common.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Card, CardDto>()
            .ForMember(dest => dest.AssigneeName, opt => opt.MapFrom(src => 
                src.Assignee != null ? $"{src.Assignee.FirstName} {src.Assignee.LastName}" : null))
            .ForMember(dest => dest.ListName, opt => opt.MapFrom(src => src.List.Name));

        CreateMap<User, UserDto>();
        
        CreateMap<List, ListDto>()
            .ForMember(dest => dest.Cards, opt => opt.MapFrom(src => src.Cards));
    }
}