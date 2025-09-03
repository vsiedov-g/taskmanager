using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Application.Common.Models;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;
using TaskManager.Infrastructure.Models;

namespace TaskManager.Infrastructure.Services;

public class SlackMessageBuilder : ISlackMessageBuilder
{
    private readonly IUserRepository _userRepository;
    private readonly ICardRepository _cardRepository;
    private readonly IListRepository _listRepository;
    private readonly SlackSettings _settings;
    private readonly ILogger<SlackMessageBuilder> _logger;

    public SlackMessageBuilder(
        IUserRepository userRepository,
        ICardRepository cardRepository,
        IListRepository listRepository,
        IOptions<SlackSettings> settings,
        ILogger<SlackMessageBuilder> logger)
    {
        _userRepository = userRepository;
        _cardRepository = cardRepository;
        _listRepository = listRepository;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<SlackMessage> BuildActivityMessageAsync(ActivityLog activityLog)
    {
        _logger.LogDebug("Building Slack message for activity {Action} on {EntityType}", 
            activityLog.Action, activityLog.EntityType);

        var user = await _userRepository.GetByIdAsync(activityLog.UserId);
        var userName = $"{user?.Name ?? ""}".Trim();
        if (string.IsNullOrEmpty(userName)) userName = "Unknown User";

        var card = activityLog.CardId.HasValue ? 
            await _cardRepository.GetByIdAsync(activityLog.CardId.Value) : null;

        var messageText = activityLog.Action.ToUpper() switch
        {
            "CREATE" => BuildCreateMessage(card, userName, activityLog),
            "UPDATE" => BuildUpdateMessage(card, userName, activityLog),
            "MOVE" => BuildMoveMessage(card, userName, activityLog),
            "DELETE" => BuildDeleteMessage(card, userName, activityLog),
            "ASSIGN" => BuildAssignMessage(card, userName, activityLog),
            _ => BuildGenericMessage(card, userName, activityLog)
        };

        var blocks = await BuildBlockKitBlocks(card, userName, activityLog);

        return new SlackMessage
        {
            Text = messageText,
            Channel = _settings.Channel,
            Blocks = blocks
        };
    }

    public async Task<SlackMessage> BuildActivityMessage(SlackNotificationData notificationData)
    {
        _logger.LogDebug("Building Slack message for activity {Action} on {EntityType}", 
            notificationData.ActivityLog.Action, notificationData.ActivityLog.EntityType);

        var messageText = notificationData.ActivityLog.Action.ToUpper() switch
        {
            "CREATE" => BuildCreateMessage(notificationData),
            "UPDATE" => BuildUpdateMessage(notificationData),
            "MOVE" => BuildMoveMessage(notificationData),
            "DELETE" => BuildDeleteMessage(notificationData),
            "ASSIGN" => BuildAssignMessage(notificationData),
            _ => BuildGenericMessage(notificationData)
        };

        var blocks = await BuildBlockKitBlocks(notificationData);

        return new SlackMessage
        {
            Text = messageText,
            Channel = _settings.Channel,
            Blocks = blocks
        };
    }

    private string BuildCreateMessage(Card? card, string userName, ActivityLog activityLog)
    {
        var text = $"🆕 *New task created*\n" +
                   $"*Task:* {card?.Title ?? "Unknown Task"}\n" +
                   $"*Created by:* {userName} on {activityLog.CreatedAt:MMM dd, yyyy 'at' h:mm tt}\n";

        if (card != null)
        {
            text += $"*Priority:* {GetPriorityEmoji(card.Priority)} {card.Priority}\n" +
                   $"*Status:* {GetStatusEmoji(card.Status)} {card.Status}\n";

            if (card.DueDate != null)
                text += $"*Due Date:* {card.DueDate:MMM dd, yyyy}\n";

            if (!string.IsNullOrEmpty(card.Description))
                text += $"*Description:* {card.Description}\n";
        }

        if (!string.IsNullOrEmpty(_settings.BaseUrl) && card?.Id != null)
            text += $"*Link:* {_settings.BaseUrl}/tasks/{card.Id}";

        return text;
    }

    private string BuildUpdateMessage(Card? card, string userName, ActivityLog activityLog)
    {
        var text = $"✏️ *Task updated*\n" +
                   $"*Task:* {card?.Title ?? "Unknown Task"}\n" +
                   $"*Updated by:* {userName} on {activityLog.CreatedAt:MMM dd, yyyy 'at' h:mm tt}\n";

        if (!string.IsNullOrEmpty(activityLog.Description))
            text += $"*Changes:* {activityLog.Description}\n";

        if (!string.IsNullOrEmpty(_settings.BaseUrl) && card?.Id != null)
            text += $"*Link:* {_settings.BaseUrl}/tasks/{card.Id}";

        return text;
    }

    private string BuildMoveMessage(Card? card, string userName, ActivityLog activityLog)
    {
        var text = $"🔄 *Task moved*\n" +
                   $"*Task:* {card?.Title ?? "Unknown Task"}\n" +
                   $"*Moved by:* {userName} on {activityLog.CreatedAt:MMM dd, yyyy 'at' h:mm tt}\n";

        if (!string.IsNullOrEmpty(activityLog.Description))
            text += $"*Details:* {activityLog.Description}\n";

        if (!string.IsNullOrEmpty(_settings.BaseUrl) && card?.Id != null)
            text += $"*Link:* {_settings.BaseUrl}/tasks/{card.Id}";

        return text;
    }

    private string BuildDeleteMessage(Card? card, string userName, ActivityLog activityLog)
    {
        return $"🗑️ *Task deleted*\n" +
               $"*Task:* {card?.Title ?? activityLog.Description ?? "Unknown Task"}\n" +
               $"*Deleted by:* {userName} on {activityLog.CreatedAt:MMM dd, yyyy 'at' h:mm tt}";
    }

    private string BuildAssignMessage(Card? card, string userName, ActivityLog activityLog)
    {
        var text = $"👤 *Task assignment updated*\n" +
                   $"*Task:* {card?.Title ?? "Unknown Task"}\n" +
                   $"*Updated by:* {userName} on {activityLog.CreatedAt:MMM dd, yyyy 'at' h:mm tt}\n";

        if (!string.IsNullOrEmpty(activityLog.Description))
            text += $"*Details:* {activityLog.Description}\n";

        if (!string.IsNullOrEmpty(_settings.BaseUrl) && card?.Id != null)
            text += $"*Link:* {_settings.BaseUrl}/tasks/{card.Id}";

        return text;
    }

    private string BuildGenericMessage(Card? card, string userName, ActivityLog activityLog)
    {
        var emoji = GetActionEmoji(activityLog.Action);
        var text = $"{emoji} *{activityLog.Action}*\n";

        if (card != null)
            text += $"*Task:* {card.Title}\n";
        
        text += $"*By:* {userName} on {activityLog.CreatedAt:MMM dd, yyyy 'at' h:mm tt}\n";

        if (!string.IsNullOrEmpty(activityLog.Description))
            text += $"*Details:* {activityLog.Description}\n";

        if (!string.IsNullOrEmpty(_settings.BaseUrl) && card?.Id != null)
            text += $"*Link:* {_settings.BaseUrl}/tasks/{card.Id}";

        return text;
    }

    private string GetPriorityEmoji(CardPriority priority) => priority switch
    {
        CardPriority.Critical => "🔴",
        CardPriority.High => "🟡",
        CardPriority.Medium => "🔵",
        CardPriority.Low => "⚪",
        _ => "⚫"
    };

    private string GetStatusEmoji(CardStatus status) => status switch
    {
        CardStatus.Todo => "📋",
        CardStatus.InProgress => "⏳",
        CardStatus.Done => "✅",
        _ => "❓"
    };

    private string GetActionEmoji(string action) => action.ToLower() switch
    {
        "create" => "🆕",
        "update" => "✏️",
        "move" => "🔄",
        "delete" => "🗑️",
        "assign" => "👤",
        _ => "📝"
    };

    // Overloaded methods for SlackNotificationData (no database access required)
    private string BuildCreateMessage(SlackNotificationData data)
    {
        var activityLog = data.ActivityLog;
        var text = $"🆕 *New task created*\n" +
                   $"*Task:* {data.CardTitle ?? "Unknown Task"}\n" +
                   $"*Created by:* {data.UserName} on {activityLog.CreatedAt:MMM dd, yyyy 'at' h:mm tt}\n";

        if (data.CardPriority != null)
            text += $"*Priority:* {GetPriorityEmoji(data.CardPriority.Value)} {data.CardPriority}\n";

        if (data.CardStatus != null)
            text += $"*Status:* {GetStatusEmoji(data.CardStatus.Value)} {data.CardStatus}\n";

        if (data.CardDueDate != null)
            text += $"*Due Date:* {data.CardDueDate:MMM dd, yyyy}\n";

        if (!string.IsNullOrEmpty(data.CardDescription))
            text += $"*Description:* {data.CardDescription}\n";

        if (!string.IsNullOrEmpty(_settings.BaseUrl) && activityLog.CardId != null)
            text += $"*Link:* {_settings.BaseUrl}/tasks/{activityLog.CardId}";

        return text;
    }

    private string BuildUpdateMessage(SlackNotificationData data)
    {
        var activityLog = data.ActivityLog;
        var text = $"✏️ *Task updated*\n" +
                   $"*Task:* {data.CardTitle ?? "Unknown Task"}\n" +
                   $"*Updated by:* {data.UserName} on {activityLog.CreatedAt:MMM dd, yyyy 'at' h:mm tt}\n";

        if (!string.IsNullOrEmpty(activityLog.Description))
            text += $"*Changes:* {activityLog.Description}\n";

        if (!string.IsNullOrEmpty(_settings.BaseUrl) && activityLog.CardId != null)
            text += $"*Link:* {_settings.BaseUrl}/tasks/{activityLog.CardId}";

        return text;
    }

    private string BuildMoveMessage(SlackNotificationData data)
    {
        var activityLog = data.ActivityLog;
        var text = $"🔄 *Task moved*\n" +
                   $"*Task:* {data.CardTitle ?? "Unknown Task"}\n" +
                   $"*Moved by:* {data.UserName} on {activityLog.CreatedAt:MMM dd, yyyy 'at' h:mm tt}\n";

        if (!string.IsNullOrEmpty(activityLog.Description))
            text += $"*Details:* {activityLog.Description}\n";

        if (!string.IsNullOrEmpty(_settings.BaseUrl) && activityLog.CardId != null)
            text += $"*Link:* {_settings.BaseUrl}/tasks/{activityLog.CardId}";

        return text;
    }

    private string BuildDeleteMessage(SlackNotificationData data)
    {
        var activityLog = data.ActivityLog;
        return $"🗑️ *Task deleted*\n" +
               $"*Task:* {data.CardTitle ?? activityLog.Description ?? "Unknown Task"}\n" +
               $"*Deleted by:* {data.UserName} on {activityLog.CreatedAt:MMM dd, yyyy 'at' h:mm tt}";
    }

    private string BuildAssignMessage(SlackNotificationData data)
    {
        var activityLog = data.ActivityLog;
        var text = $"👤 *Task assignment updated*\n" +
                   $"*Task:* {data.CardTitle ?? "Unknown Task"}\n" +
                   $"*Updated by:* {data.UserName} on {activityLog.CreatedAt:MMM dd, yyyy 'at' h:mm tt}\n";

        if (!string.IsNullOrEmpty(activityLog.Description))
            text += $"*Details:* {activityLog.Description}\n";

        if (!string.IsNullOrEmpty(_settings.BaseUrl) && activityLog.CardId != null)
            text += $"*Link:* {_settings.BaseUrl}/tasks/{activityLog.CardId}";

        return text;
    }

    private string BuildGenericMessage(SlackNotificationData data)
    {
        var activityLog = data.ActivityLog;
        var emoji = GetActionEmoji(activityLog.Action);
        var text = $"{emoji} *{activityLog.Action}*\n";

        if (!string.IsNullOrEmpty(data.CardTitle))
            text += $"*Task:* {data.CardTitle}\n";
        
        text += $"*By:* {data.UserName} on {activityLog.CreatedAt:MMM dd, yyyy 'at' h:mm tt}\n";

        if (!string.IsNullOrEmpty(activityLog.Description))
            text += $"*Details:* {activityLog.Description}\n";

        if (!string.IsNullOrEmpty(_settings.BaseUrl) && activityLog.CardId != null)
            text += $"*Link:* {_settings.BaseUrl}/tasks/{activityLog.CardId}";

        return text;
    }

    private async Task<object[]> BuildBlockKitBlocks(Card? card, string userName, ActivityLog activityLog)
    {
        var emoji = GetActionEmoji(activityLog.Action);
        var headerText = await BuildHeaderText(card, activityLog);

        var blocks = new List<object>
        {
            new
            {
                type = "header",
                text = new
                {
                    type = "plain_text",
                    text = headerText
                }
            },
            new
            {
                type = "section",
                fields = await BuildFields(card, userName, activityLog)
            }
        };

        if (!string.IsNullOrEmpty(_settings.ClientBaseUrl) && card?.Id != null)
        {
            blocks.Add(new
            {
                type = "actions",
                elements = new[]
                {
                    new
                    {
                        type = "button",
                        text = new
                        {
                            type = "plain_text",
                            text = "Open in Web"
                        },
                        url = $"{_settings.ClientBaseUrl}/task/{card.Id}",
                        action_id = "open_task"
                    }
                }
            });
        }

        return blocks.ToArray();
    }

    private async Task<object[]> BuildBlockKitBlocks(SlackNotificationData data)
    {
        var activityLog = data.ActivityLog;
        var headerText = BuildHeaderText(data);

        var blocks = new List<object>
        {
            new
            {
                type = "header",
                text = new
                {
                    type = "plain_text",
                    text = headerText
                }
            },
            new
            {
                type = "section",
                fields = await BuildFields(data)
            }
        };

        if (!string.IsNullOrEmpty(_settings.ClientBaseUrl) && activityLog.CardId != null)
        {
            blocks.Add(new
            {
                type = "actions",
                elements = new[]
                {
                    new
                    {
                        type = "button",
                        text = new
                        {
                            type = "plain_text",
                            text = "Open in Web"
                        },
                        url = $"{_settings.ClientBaseUrl}/task/{activityLog.CardId}",
                        action_id = "open_task"
                    }
                }
            });
        }

        return blocks.ToArray();
    }

    private async Task<object[]> BuildFields(Card? card, string userName, ActivityLog activityLog)
    {
        var fields = new List<object>();

        // Get list information
        var listName = "Unknown List";
        if (card?.ListId != null)
        {
            var list = await _listRepository.GetByIdAsync(card.ListId);
            listName = list?.Name ?? "Unknown List";
        }

        // For MOVE action, show list transition
        if (activityLog.Action.ToUpper() == "MOVE" && !string.IsNullOrEmpty(activityLog.Description))
        {
            // Parse the description for list transition info
            var transitionInfo = ParseListTransition(activityLog.Description);
            if (!string.IsNullOrEmpty(transitionInfo))
            {
                fields.Add(new
                {
                    type = "mrkdwn",
                    text = $"*📋 List:*\n{transitionInfo}"
                });
            }
            else
            {
                fields.Add(new
                {
                    type = "mrkdwn",
                    text = $"*📋 List:*\n{listName}"
                });
            }
        }
        else
        {
            fields.Add(new
            {
                type = "mrkdwn",
                text = $"*📋 List:*\n{listName}"
            });
        }

        // Assignee
        var assigneeName = "Unassigned";
        if (card?.AssigneeId != null)
        {
            var assignee = await _userRepository.GetByIdAsync(card.AssigneeId.Value);
            assigneeName = $"{assignee?.Name ?? ""}".Trim();
            if (string.IsNullOrEmpty(assigneeName)) assigneeName = "Unknown User";
        }
        
        fields.Add(new
        {
            type = "mrkdwn",
            text = $"*👤 Assignee:*\n{assigneeName}"
        });

        // Priority
        if (card != null)
        {
            fields.Add(new
            {
                type = "mrkdwn",
                text = $"*⚡ Priority:*\n{GetPriorityEmoji(card.Priority)} {card.Priority}"
            });
        }

        // Due Date
        if (card?.DueDate != null)
        {
            fields.Add(new
            {
                type = "mrkdwn",
                text = $"*📅 Due Date:*\n{card.DueDate:MMM dd, yyyy}"
            });
        }

        // Labels (placeholder - assuming we might have labels in the future)
        // fields.Add(new
        // {
        //     type = "mrkdwn",
        //     text = $"*Labels:*\nNone"
        // });

        return fields.ToArray();
    }

    private Task<object[]> BuildFields(SlackNotificationData data)
    {
        var activityLog = data.ActivityLog;
        var fields = new List<object>();

        // List information
        var listName = data.ListTitle ?? "Unknown List";
        
        // For MOVE action, show list transition
        if (activityLog.Action.ToUpper() == "MOVE" && !string.IsNullOrEmpty(activityLog.Description))
        {
            var transitionInfo = ParseListTransition(activityLog.Description);
            if (!string.IsNullOrEmpty(transitionInfo))
            {
                fields.Add(new
                {
                    type = "mrkdwn",
                    text = $"*📋 List:*\n{transitionInfo}"
                });
            }
            else
            {
                fields.Add(new
                {
                    type = "mrkdwn",
                    text = $"*📋 List:*\n{listName}"
                });
            }
        }
        else
        {
            fields.Add(new
            {
                type = "mrkdwn",
                text = $"*📋 List:*\n{listName}"
            });
        }

        // Assignee
        var assigneeName = data.AssigneeName ?? "Unassigned";
        fields.Add(new
        {
            type = "mrkdwn",
            text = $"*👤 Assignee:*\n{assigneeName}"
        });

        // Priority
        if (data.CardPriority != null)
        {
            fields.Add(new
            {
                type = "mrkdwn",
                text = $"*⚡ Priority:*\n{GetPriorityEmoji(data.CardPriority.Value)} {data.CardPriority}"
            });
        }

        // Due Date
        if (data.CardDueDate != null)
        {
            fields.Add(new
            {
                type = "mrkdwn",
                text = $"*📅 Due Date:*\n{data.CardDueDate:MMM dd, yyyy}"
            });
        }

        // Labels (placeholder)
        // fields.Add(new
        // {
        //     type = "mrkdwn",
        //     text = $"*Labels:*\nNone"
        // });

        return Task.FromResult(fields.ToArray());
    }

    private Task<string> BuildHeaderText(Card? card, ActivityLog activityLog)
    {
        var actionText = activityLog.Action.ToUpper() switch
        {
            "CREATE" => "Task Created",
            "UPDATE" => "Task Updated",
            "MOVE" => "Task Moved",
            "DELETE" => "Task Deleted",
            "ASSIGN" => "Task Assigned",
            _ => "Task Activity"
        };

        var title = card?.Title ?? "Unknown Task";
        
        return Task.FromResult($"{title}");
    }

    private string BuildHeaderText(SlackNotificationData data)
    {
        var activityLog = data.ActivityLog;
        var title = data.CardTitle ?? "Unknown Task";
        
        return $"{title}";
    }

    private string ParseListTransition(string description)
    {
        // Try to parse list transition from activity log description
        // Expected format might be "Moved from 'List A' to 'List B'" or similar
        // This is a simple implementation - adjust based on your actual description format
        
        if (description.Contains("moved") || description.Contains("Moved"))
        {
            // Look for patterns like "from X to Y"
            var fromIndex = description.IndexOf("from", StringComparison.OrdinalIgnoreCase);
            var toIndex = description.IndexOf("to", StringComparison.OrdinalIgnoreCase);
            
            if (fromIndex != -1 && toIndex != -1 && toIndex > fromIndex)
            {
                try
                {
                    var fromPart = description.Substring(fromIndex + 4, toIndex - fromIndex - 4).Trim();
                    var toPart = description.Substring(toIndex + 2).Trim();
                    
                    // Clean up the parts (remove quotes, extra whitespace)
                    fromPart = fromPart.Trim('\'', '"', ' ');
                    toPart = toPart.Trim('\'', '"', ' ');
                    
                    return $"{fromPart} >>> {toPart}";
                }
                catch
                {
                    // If parsing fails, return empty string to fall back to regular list display
                    return string.Empty;
                }
            }
        }
        
        return string.Empty;
    }
}