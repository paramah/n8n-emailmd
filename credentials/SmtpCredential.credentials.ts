import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class SmtpCredential implements ICredentialType {
	name = 'smtp';
	displayName = 'SMTP';
	documentationUrl = 'https://docs.n8n.io/integrations/builtin/credentials/sendemail/';
	properties: INodeProperties[] = [
		{
			displayName: 'Host',
			name: 'host',
			type: 'string',
			default: '',
			placeholder: 'smtp.example.com',
		},
		{
			displayName: 'Port',
			name: 'port',
			type: 'number',
			default: 465,
		},
		{
			displayName: 'Secure',
			name: 'secure',
			type: 'boolean',
			default: true,
			description: 'Whether to use SSL/TLS',
		},
		{
			displayName: 'User',
			name: 'user',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
	];
}
