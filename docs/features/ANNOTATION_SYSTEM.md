# Document Annotation and Commenting System

## Overview

The TrakNor CMMS now includes a comprehensive document annotation and commenting system that allows users to collaborate on procedure documents by adding highlights, notes, questions, corrections, and warnings directly on PDF and Markdown files.

## Features Implemented

### 1. Annotation Types

- **Highlight** (📝): Mark important text sections
- **Note** (📄): Add explanatory notes
- **Question** (❓): Ask questions or request clarifications
- **Correction** (✏️): Suggest corrections or improvements
- **Warning** (⚠️): Mark safety concerns or important alerts

### 2. Core Functionality

#### Annotation Creation
- Select text in documents to create annotations
- Choose annotation type and add content
- Annotations are positioned precisely on the document
- Support for both PDF (page-based) and Markdown (text-based) documents

#### Commenting System
- Add comments to any annotation
- Reply to existing comments (threaded discussions)
- Mention other users with `@username` syntax
- Mark comments as resolved or archived

#### Visual Features
- Color-coded annotations by type
- Hover tooltips showing annotation content
- Visual markers on document with type icons
- Annotation overlay that doesn't interfere with document reading

### 3. User Interface Components

#### Annotation Toolbar
- Toggle annotation mode on/off
- Select annotation type before creating
- Filter visible annotation types
- Show/hide resolved annotations
- Export and share annotation links

#### Annotation Panel
- Comprehensive view of all annotations
- Search and filter capabilities
- Threaded comment discussions
- Annotation status management (resolve/unresolve)

#### Document Integration
- Seamless overlay on existing PDF and Markdown viewers
- Non-intrusive annotation markers
- Click annotations to view details
- Switch between document and annotation views

### 4. Data Management

#### Storage
- Annotations stored in localStorage with IndexedDB fallback
- Comments linked to annotations via IDs
- Version-specific annotations (tied to document versions)
- Mock data provided for demonstration

#### Persistence
- Annotations survive page refreshes
- Version history maintained
- Export functionality for backup/sharing
- User attribution and timestamps

## Technical Implementation

### New Components

1. **AnnotationPanel.tsx** - Main annotation management interface
2. **AnnotationOverlay.tsx** - Document overlay for displaying annotations
3. **AnnotationToolbar.tsx** - Toolbar controls for annotation features

### Enhanced Models

Extended the procedure models with:
- `DocumentAnnotation` interface
- `Comment` interface  
- `AnnotationThread` interface
- `ProcedureWithAnnotations` interface

### Data Store Functions

Added to `proceduresStore.ts`:
- `createAnnotation()` - Create new annotations
- `updateAnnotation()` - Modify existing annotations
- `deleteAnnotation()` - Remove annotations
- `createComment()` - Add comments
- `updateComment()` - Modify comments
- `deleteComment()` - Remove comments
- `getProcedureWithAnnotations()` - Get enriched procedure data
- `exportAnnotations()` - Export annotation data

### Enhanced Viewer

Updated `ProcedureViewer.tsx` to include:
- Annotation mode toggle
- Overlay rendering for both PDF and Markdown
- Three-tab interface (Document, Annotations, Versions)
- Integrated annotation management

## Usage Guide

### For Users

1. **Creating Annotations**
   - Open any procedure document
   - Click "Anotar" to enter annotation mode
   - Select annotation type from dropdown
   - Highlight text in the document
   - Add your annotation content in the popup
   - Click "Criar Anotação"

2. **Managing Annotations**
   - Switch to "Anotações" tab to view all annotations
   - Use search and filters to find specific annotations
   - Click annotations to jump to their document location
   - Resolve annotations when addressed

3. **Commenting**
   - Click on any annotation to expand its thread
   - Add comments to discuss the annotation
   - Use @username to mention other users
   - Reply to create threaded discussions

4. **Collaboration**
   - Export annotations for sharing
   - Use share link functionality
   - Filter by author or status
   - Track unresolved items

### For Administrators

1. **Annotation Statistics**
   - View total annotations by type
   - Monitor resolved vs unresolved items
   - Track user engagement

2. **Data Management**
   - Export annotation data
   - Monitor storage usage
   - Backup annotation content

## File Structure

```
src/
├── components/
│   └── procedure/
│       ├── AnnotationPanel.tsx         # Main annotation interface
│       ├── AnnotationOverlay.tsx       # Document overlay
│       ├── AnnotationToolbar.tsx       # Toolbar controls
│       └── ProcedureViewer.tsx         # Enhanced viewer
├── data/
│   └── proceduresStore.ts              # Enhanced data store
├── models/
│   └── procedure.ts                    # Extended models
└── mocks/
    ├── procedure_annotations.json      # Sample annotations
    └── procedure_comments.json         # Sample comments
```

## Security & Privacy

- All annotation data stored locally (no external services)
- User attribution for all annotations and comments
- No sensitive data transmitted
- Proper sanitization of user input

## Accessibility

- ARIA labels for all annotation controls
- Keyboard navigation support
- Screen reader compatible
- High contrast annotation markers
- Focus management for modals and overlays

## Performance

- Efficient annotation rendering
- Lazy loading of annotation data
- Optimized overlay positioning
- Minimal impact on document viewing performance

## Browser Support

- Modern browsers with ES6+ support
- Local storage and IndexedDB required
- PDF.js compatibility for PDF annotations
- Responsive design for desktop and tablet

## Future Enhancements

Potential improvements could include:
- Real-time collaborative editing
- Advanced annotation analytics
- Integration with external systems
- Mobile app support
- Annotation templates
- Approval workflows
- Advanced search capabilities
- Annotation history tracking