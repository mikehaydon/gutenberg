/**
 * WordPress dependencies
 */
import { renderToString } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { withState } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './editor.scss';
import './style.scss';
import { rawHandler } from '../../api';
import RichText from '../../rich-text';
import BlockControls from '../../block-controls';
import BlockAlignmentToolbar from '../../block-alignment-toolbar';
import InnerBlocks from '../../inner-blocks';

const blockAttributes = {
	citation: {
		type: 'array',
		source: 'children',
		selector: 'cite',
	},
	align: {
		type: 'string',
		default: 'none',
	},
};

export const name = 'core/pullquote';

export const settings = {

	title: __( 'Pullquote' ),

	description: __( 'A pullquote is a brief, attention-catching quotation taken from the main text of an article and used as a subheading or graphic feature.' ),

	icon: 'format-quote',

	category: 'formatting',

	attributes: blockAttributes,

	getEditWrapperProps( attributes ) {
		const { align } = attributes;
		if ( 'left' === align || 'right' === align || 'wide' === align || 'full' === align ) {
			return { 'data-align': align };
		}
	},

	edit: withState( {
		editable: 'content',
	} )( ( { attributes, setAttributes, isSelected, className, editable, setState } ) => {
		const { citation, align } = attributes;
		const updateAlignment = ( nextAlign ) => setAttributes( { align: nextAlign } );
		const onSetActiveEditable = ( newEditable ) => () => setState( { editable: newEditable } );

		return [
			isSelected && (
				<BlockControls key="controls">
					<BlockAlignmentToolbar
						value={ align }
						onChange={ updateAlignment }
					/>
				</BlockControls>
			),
			<blockquote key="quote" className={ className }>
				<InnerBlocks />
				{ ( citation || isSelected ) && (
					<RichText
						tagName="cite"
						value={ citation }
						/* translators: the individual or entity quoted */
						placeholder={ __( 'Write citation…' ) }
						onChange={
							( nextCitation ) => setAttributes( {
								citation: nextCitation,
							} )
						}
						isSelected={ isSelected && editable === 'cite' }
						onFocus={ onSetActiveEditable( 'cite' ) }
					/>
				) }
			</blockquote>,
		];
	} ),

	save( { attributes } ) {
		const { citation, align } = attributes;

		return (
			<blockquote className={ `align${ align }` }>
				<InnerBlocks.Content />
				{ citation && citation.length > 0 && (
					<cite>{ citation }</cite>
				) }
			</blockquote>
		);
	},

	deprecated: [ {
		attributes: {
			...blockAttributes,
			value: {
				type: 'array',
				source: 'query',
				selector: 'blockquote > p',
				query: {
					children: {
						source: 'node',
					},
				},
			},
		},

		migrate( { value, citation, align } ) {
			const HTML = value.map( ( { children } ) => renderToString( children ) ).join( '' );

			return {
				_innerBlocks: rawHandler( { HTML, mode: 'BLOCKS' } ),
				citation,
				align,
			};
		},

		save( { attributes } ) {
			const { value, citation, align } = attributes;

			return (
				<blockquote className={ `align${ align }` }>
					{ value && value.map( ( paragraph, i ) =>
						<p key={ i }>{ paragraph.children && paragraph.children.props.children }</p>
					) }
					{ citation && citation.length > 0 && (
						<cite>{ citation }</cite>
					) }
				</blockquote>
			);
		},
	}, {
		attributes: {
			...blockAttributes,
			value: {
				type: 'array',
				source: 'query',
				selector: 'blockquote > p',
				query: {
					children: {
						source: 'node',
					},
				},
			},
			citation: {
				type: 'array',
				source: 'children',
				selector: 'footer',
			},
		},

		save( { attributes } ) {
			const { value, citation, align } = attributes;

			return (
				<blockquote className={ `align${ align }` }>
					{ value && value.map( ( paragraph, i ) =>
						<p key={ i }>{ paragraph.children && paragraph.children.props.children }</p>
					) }
					{ citation && citation.length > 0 && (
						<footer>{ citation }</footer>
					) }
				</blockquote>
			);
		},
	} ],
};
