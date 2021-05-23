const { Client, MessageEmbed } = require('discord.js');
const client = new Client();

const dotenv = require('dotenv');
dotenv.config();

const { API } = require('nhentai-api');
const nhentaiAPI = new API();

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

const fetcher = (code) => nhentaiAPI.getBook(code);

const paginationEmbed = require('discord.js-pagination');

const keepAlive = require('./server');

const handleOnValidMessage = (msg) => {
	if (/^(hentai)\s[0-9]{6}$/.test(msg.content)) {
		fetcher(msg.content.split(' ')[1]).then(async (book) => {
			const hentaiEmbed = new MessageEmbed({
				title: book.title.pretty,
				id: book.id,
				fields: [
					{ name: 'Pages: ', value: book.pages.length, inline: true },
					{ name: 'Tags:', value: book.tags.map((tag) => tag.name).join(', ') }
				],
				thumbnail: {
					url: nhentaiAPI.getThumbURL(book.pages[0])
				},
				image: {
					url: nhentaiAPI.getImageURL(book.cover),
					height: book.cover.height,
					width: book.cover.width
				}
			});

			msg.channel.send(hentaiEmbed);

			const pages = book.pages.map((page) => {
				return new MessageEmbed({
					image: {
						url: nhentaiAPI.getImageURL(page),
						height: page.height,
						width: page.width
					}
				});
			});

			paginationEmbed(msg, pages, ['⏪', '⏩'], 999999999);
		});
	}
};

client.on('message', handleOnValidMessage);

keepAlive();
client.login(process.env.TOKEN);
