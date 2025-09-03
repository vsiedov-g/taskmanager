Slack Integration
SlackNotifier with Block Kit, retry and logging
When a Card is created, assigned, or moved to a different List, a Slack notification must be sent to a configured channel.


Notifications should include key details: Card name, List name, Assignee, and Due Date (if available).


Slack integration may be implemented using a simple Incoming Webhook.

The system should integrate with Slack to send notifications when key events occur:

1. Task created
2. Task list changed
3. Task description updated
4. Task assignee changed
5. Task due date updated

Slack messages must include:
- Header: [Task #id] Title
- Fields: list, assignee, due date, labels
- Button: 'Open in Web'
