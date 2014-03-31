<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="2.0"
    xmlns:urwg="http://www.gridforum.org/2003/ur-wg"
    xmlns:String="http://xml.apache.org/xalan/java/java.lang.String">
    
<xsl:output method="text"/>

<xsl:template match="rss">

<xsl:text>[</xsl:text>

<xsl:for-each select="channel/item">
<xsl:sort select="key"/>

<xsl:text>
{</xsl:text>
<xsl:text>
"title" : "</xsl:text>
<!-- remove leading/trailing spaces and remove quotes -->
<xsl:value-of select="translate(normalize-space(title),'&quot;','')" />
<xsl:text>",</xsl:text>


<xsl:text>
"url" : "</xsl:text>
<xsl:value-of select="link"/>
<xsl:text>",</xsl:text>

<xsl:text>
"key" : "</xsl:text>
<xsl:value-of select="key"/>
<xsl:text>",</xsl:text>

<xsl:text>
"assignee" : "</xsl:text>
<xsl:choose>
<xsl:when test="assignee/@username=-1">
   <xsl:value-of select="assignee"/>
</xsl:when>
<xsl:otherwise>
  <xsl:value-of select="assignee/@username"/>
</xsl:otherwise>
</xsl:choose>
<xsl:text>",</xsl:text>

<xsl:text>
"reporter" : "</xsl:text>
<xsl:value-of select="reporter/@username"/>
<xsl:text>",</xsl:text>

<xsl:text>
"projectKey" : "</xsl:text>
<xsl:value-of select="project/@key"/>
<xsl:text>",</xsl:text>

<xsl:text>
"priority" : "</xsl:text>
<xsl:value-of select="priority"/>
<xsl:text>",</xsl:text>

<xsl:text>
"status" : "</xsl:text>
<xsl:value-of select="status"/>
<xsl:text>",</xsl:text>

<xsl:text>
"updated" : "</xsl:text>
<xsl:value-of select="updated"/>
<xsl:text>",</xsl:text>

<xsl:text>
"affectsVersion" : "</xsl:text>
<xsl:value-of select="version"/>
<xsl:text>",</xsl:text>

<xsl:text>
"fixVersion" : "</xsl:text>
<xsl:value-of select="fixVersion"/>
<xsl:text>",</xsl:text>

<xsl:text>
"labels" : "</xsl:text>
<xsl:for-each select="labels/label">
   <xsl:text></xsl:text>
   <xsl:value-of select="."/>
   <xsl:if test="position()!=last()">
        <xsl:text> </xsl:text>
      </xsl:if>
   </xsl:for-each>
<xsl:text>"</xsl:text>
<xsl:text>},</xsl:text>

</xsl:for-each> <!-- end foreach page -->

<xsl:text>
] 
</xsl:text>

</xsl:template>
  
</xsl:stylesheet>  
