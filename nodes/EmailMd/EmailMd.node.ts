import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { render } from 'emailmd';
import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';

export class EmailMd implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Send Email (Markdown)',
		name: 'emailMd',
		icon: 'fa:envelope',
		group: ['output'],
		version: 1,
		description: 'Renders a Markdown template with emailmd and sends it via SMTP',
		defaults: {
			name: 'Send Email (Markdown)',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'smtpApi',
				required: true,
			},
		],
		properties: [
			// ─── Recipients ────────────────────────────────────────────────────
			{
				displayName: 'From Name',
				name: 'fromName',
				type: 'string',
				default: '',
				placeholder: 'John Doe',
				description: 'Sender display name',
			},
			{
				displayName: 'From Email',
				name: 'fromEmail',
				type: 'string',
				default: '',
				placeholder: 'sender@example.com',
				description: 'Sender email address',
				required: true,
			},
			{
				displayName: 'To',
				name: 'toEmail',
				type: 'string',
				default: '',
				placeholder: 'recipient@example.com',
				description: 'Comma-separated list of recipients',
				required: true,
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				placeholder: 'Hello from n8n!',
				required: true,
			},
			{
				displayName: 'Reply To',
				name: 'replyTo',
				type: 'string',
				default: '',
				placeholder: 'reply@example.com',
			},
			{
				displayName: 'CC',
				name: 'cc',
				type: 'string',
				default: '',
				placeholder: 'cc@example.com',
			},
			{
				displayName: 'BCC',
				name: 'bcc',
				type: 'string',
				default: '',
				placeholder: 'bcc@example.com',
			},

			// ─── Markdown Content ───────────────────────────────────────────────
			{
				displayName: 'Markdown',
				name: 'markdown',
				type: 'string',
				typeOptions: {
					rows: 20,
				},
				default: `---
preheader: Preview text shown in email clients
---

# Hello {{name}}!

Welcome to our service. Here's what you need to know.

[Get Started](https://example.com){button}
`,
				description:
					'Markdown content to render. Supports YAML frontmatter for preheader and theme settings. Expressions like {{$JSON.name}} are evaluated before rendering.',
				required: true,
				noDataExpression: false,
			},

			// ─── Theme Options ──────────────────────────────────────────────────
			{
				displayName: 'Theme',
				name: 'theme',
				type: 'options',
				options: [
					{ name: 'Default', value: 'default' },
					{ name: 'Light', value: 'light' },
					{ name: 'Dark', value: 'dark' },
				],
				default: 'default',
				description: 'Base theme for the email',
			},
			{
				displayName: 'Theme Overrides',
				name: 'themeOverrides',
				type: 'collection',
				placeholder: 'Add Override',
				default: {},
				description: 'Custom theme color and typography overrides',
				options: [
					{
						displayName: 'Background Color',
						name: 'backgroundColor',
						type: 'color',
						default: '#f4f4f5',
					},
					{
						displayName: 'Brand Color',
						name: 'brandColor',
						type: 'color',
						default: '#1a56db',
					},
					{
						displayName: 'Content Background',
						name: 'contentBackground',
						type: 'color',
						default: '#ffffff',
					},
					{
						displayName: 'Content Width',
						name: 'contentWidth',
						type: 'string',
						default: '600px',
						placeholder: '600px',
					},
					{
						displayName: 'Font Family',
						name: 'fontFamily',
						type: 'string',
						default: '',
						placeholder: 'Arial, sans-serif',
					},
					{
						displayName: 'Heading Color',
						name: 'headingColor',
						type: 'color',
						default: '#111827',
					},
					{
						displayName: 'Text Color',
						name: 'bodyColor',
						type: 'color',
						default: '#374151',
					},
				],
			},

			// ─── Advanced ───────────────────────────────────────────────────────
			{
				displayName: 'Attachments',
				name: 'attachments',
				type: 'string',
				default: '',
				description:
					'Comma-separated list of binary property names that contain the attachment data',
				placeholder: 'attachment1, attachment2',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('smtpApi');

		const transporter = nodemailer.createTransport({
			host: credentials.host as string,
			port: credentials.port as number,
			secure: credentials.secure as boolean,
			auth: {
				user: credentials.user as string,
				pass: credentials.password as string,
			},
		});

		for (let i = 0; i < items.length; i++) {
			try {
				const fromName = this.getNodeParameter('fromName', i) as string;
				const fromEmail = this.getNodeParameter('fromEmail', i) as string;
				const toEmail = this.getNodeParameter('toEmail', i) as string;
				const subject = this.getNodeParameter('subject', i) as string;
				const replyTo = this.getNodeParameter('replyTo', i) as string;
				const cc = this.getNodeParameter('cc', i) as string;
				const bcc = this.getNodeParameter('bcc', i) as string;
				const markdown = this.getNodeParameter('markdown', i) as string;
				const theme = this.getNodeParameter('theme', i) as string;
				const themeOverrides = this.getNodeParameter('themeOverrides', i) as Record<string, string>;
				const attachmentProperties = this.getNodeParameter('attachments', i) as string;

				// Build theme object
				const themeOptions: Record<string, string> = {};
				if (theme !== 'default') {
					themeOptions.theme = theme;
				}
				for (const [key, value] of Object.entries(themeOverrides)) {
					if (value) {
						themeOptions[key] = value;
					}
				}

				// Render markdown -> HTML + plain text
				let rendered: { html: string; text: string; meta: Record<string, unknown> };
				try {
					rendered = render(markdown, {
						theme: Object.keys(themeOptions).length > 0 ? themeOptions : undefined,
					});
				} catch (renderError) {
					throw new NodeOperationError(
						this.getNode(),
						`emailmd render error: ${(renderError as Error).message}`,
						{ itemIndex: i },
					);
				}

				// Resolve subject from meta preheader if not set, or use provided
				const resolvedSubject = subject || (rendered.meta?.subject as string) || '(no subject)';

				// Build from address
				const from = fromName ? `"${fromName}" <${fromEmail}>` : fromEmail;

				// Handle attachments
				const attachments: Mail.Attachment[] = [];
				if (attachmentProperties.trim()) {
					const propNames = attachmentProperties.split(',').map((p) => p.trim()).filter(Boolean);
					for (const propName of propNames) {
						const binaryData = this.helpers.assertBinaryData(i, propName);
						const binaryBuffer = await this.helpers.getBinaryDataBuffer(i, propName);
						attachments.push({
							filename: binaryData.fileName || propName,
							content: binaryBuffer,
							contentType: binaryData.mimeType,
						});
					}
				}

				// Send email
				const mailOptions: Mail.Options = {
					from,
					to: toEmail,
					subject: resolvedSubject,
					html: rendered.html,
					text: rendered.text,
					...(replyTo && { replyTo }),
					...(cc && { cc }),
					...(bcc && { bcc }),
					...(attachments.length > 0 && { attachments }),
				};

				const info = await transporter.sendMail(mailOptions);

				returnData.push({
					json: {
						messageId: info.messageId,
						accepted: info.accepted,
						rejected: info.rejected,
						pending: info.pending,
						response: info.response,
						subject: resolvedSubject,
						to: toEmail,
						from,
					},
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
