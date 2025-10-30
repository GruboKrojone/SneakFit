using System;


public class CreateNoteCommand
{
	public CreateNoteCommand()
	{
		public record CreateNoteCommand (string Title, string Content, int UserId) : IRequest<int>
	}
}
